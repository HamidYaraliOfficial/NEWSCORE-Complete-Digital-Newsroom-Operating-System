import { Controller, Get, Query } from '@nestjs/common'; import { SearchService } from './search.service';
@Controller('search') export class SearchController {constructor(private readonly s:SearchService){} @Get() search(@Query()q:any){return this.s.search({q:q.q||'',language:q.language,section:q.section,from:q.from,to:q.to,limit:Number(q.limit||20)});}}
