#!/bin/sh
set -eu
until curl -fsS http://opensearch:9200 >/dev/null 2>&1; do sleep 2; done
curl -fsS -X PUT 'http://opensearch:9200/newscore_articles' -H 'Content-Type: application/json' -d @/config/index.json || true
