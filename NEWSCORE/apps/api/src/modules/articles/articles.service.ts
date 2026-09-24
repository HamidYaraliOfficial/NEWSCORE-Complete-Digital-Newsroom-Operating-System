import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { EventBusService } from '../../common/event-bus.service';
import { AuditService } from '../../common/audit.service';
import { ArticleInputSchema } from '../../common/schemas';
import { WorkflowService } from '../workflows/workflow.service';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventBusService,
    private readonly audit: AuditService,
    private readonly workflow: WorkflowService,
  ) {}

  list(query: { q?: string; section?: string; language?: string; status?: any; limit?: number }) {
    const and: any[] = [];
    if (query.q) and.push({ OR: [
      { title: { contains: query.q, mode: 'insensitive' } },
      { summary: { contains: query.q, mode: 'insensitive' } },
      { lead: { contains: query.q, mode: 'insensitive' } },
    ] });
    if (query.section) and.push({ sectionId: query.section });
    if (query.language) and.push({ language: query.language });
    if (query.status) and.push({ status: query.status });
    return this.prisma.article.findMany({
      where: { AND: and },
      include: { authors: { include: { user: true } }, section: true, category: true },
      orderBy: { publishedAt: 'desc' },
      take: Math.min(query.limit || 20, 100),
    });
  }

  async getBySlug(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        authors: { include: { user: true } },
        section: true,
        category: true,
        tags: { include: { tag: true } },
        topics: { include: { topic: true } },
        sources: { include: { source: true } },
        revisions: { orderBy: { version: 'desc' }, take: 10 },
      },
    });
    if (!article) throw new NotFoundException();
    return article;
  }

  async create(raw: any, actorId: string) {
    const dto = ArticleInputSchema.parse(raw);
    const slug = await this.uniqueSlug(dto.slug);
    const article = await this.prisma.article.create({
      data: {
        storyId: dto.storyId,
        title: dto.title,
        slug,
        subtitle: dto.subtitle,
        summary: dto.summary,
        lead: dto.lead,
        body: dto.body as any,
        status: 'DRAFT',
        priority: dto.priority,
        language: dto.language,
        sectionId: dto.sectionId,
        categoryId: dto.categoryId,
        locationId: dto.locationId,
        seo: dto.seo as any,
        social: dto.social as any,
        blocks: {
          create: dto.body.blocks.map((block: any, position: number) => ({
            position,
            type: block.type,
            data: block.data,
          })),
        },
        revisions: {
          create: {
            version: 1,
            editorId: actorId,
            snapshot: dto as any,
            reason: 'create',
          },
        },
      },
    });
    await this.audit.write({ actorId, action: 'article.create', entityType: 'Article', entityId: article.id });
    this.events.emit('article.created', { articleId: article.id, actorId });
    return article;
  }

  async update(id: string, raw: any, actorId: string) {
    const existing = await this.prisma.article.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();
    const dto = ArticleInputSchema.partial().parse(raw);
    const revisionCount = await this.prisma.articleRevision.count({ where: { articleId: id } });
    const slug = dto.slug ? await this.uniqueSlug(dto.slug, id) : existing.slug;

    const article = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.article.update({
        where: { id },
        data: {
          title: dto.title ?? existing.title,
          slug,
          subtitle: dto.subtitle,
          summary: dto.summary,
          lead: dto.lead,
          body: dto.body as any,
          language: dto.language,
          sectionId: dto.sectionId,
          categoryId: dto.categoryId,
          locationId: dto.locationId,
          priority: dto.priority as any,
          seo: dto.seo as any,
          social: dto.social as any,
        },
      });
      if (dto.body?.blocks) {
        await tx.articleBlock.deleteMany({ where: { articleId: id } });
        await tx.articleBlock.createMany({
          data: dto.body.blocks.map((block: any, position: number) => ({
            articleId: id,
            position,
            type: block.type,
            data: block.data,
          })),
        });
      }
      await tx.articleRevision.create({
        data: {
          articleId: id,
          version: revisionCount + 1,
          editorId: actorId,
          snapshot: dto as any,
          diff: { changed: Object.keys(dto) },
          reason: 'update',
        },
      });
      return updated;
    });

    await this.audit.write({ actorId, action: 'article.update', entityType: 'Article', entityId: id, metadata: { fields: Object.keys(raw) } });
    this.events.emit('article.updated', { articleId: id, actorId });
    return article;
  }

  submit(id: string, actorId: string) {
    return this.workflow.transition(id, 'SUBMITTED', actorId, 'submitted by reporter');
  }

  approve(id: string, actorId: string) {
    return this.workflow.transition(id, 'APPROVED', actorId, 'editor approval');
  }

  async publish(id: string, actorId: string) {
    const article = await this.prisma.article.findUnique({ where: { id }, include: { authors: true } });
    if (!article) throw new NotFoundException();
    if (!article.title || !article.body || !article.sectionId || !article.authors.length) {
      throw new BadRequestException('Publication Guard failed');
    }
    const updated = await this.workflow.transition(id, 'PUBLISHED', actorId, 'publish');
    await this.prisma.article.update({ where: { id }, data: { publishedAt: new Date() } });
    this.events.emit('article.published', { articleId: id });
    return updated;
  }

  private async uniqueSlug(input: string, ignoreId?: string) {
    let slug = input.trim().toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-|-$/g, '') || `story-${Date.now()}`;
    const found = await this.prisma.article.findUnique({ where: { slug } });
    if (found && found.id !== ignoreId) slug = `${slug}-${Math.floor(Math.random() * 10000)}`;
    return slug;
  }
}
