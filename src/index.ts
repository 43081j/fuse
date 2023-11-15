// TODO: this becomes the node-adapter
import { printSchema } from 'graphql';
import http from 'http';
// Yoga-features
import { createYoga } from 'graphql-yoga'
import { useDeferStream } from '@graphql-yoga/plugin-defer-stream'
// TODO: in production: disable-introspection, block-field-suggestions
// TODO: support for an _context file that allows for Context additions/typing
// TODO: authn and authz features
// TODO: proper logger support
// TODO: create persisted-operations integration where when this is co-located with
// the front-end generates the appropriate manifest
import { builder } from './builder'

export async function main() {
  let ctx;
  import.meta.glob("/types/*.ts", { eager: true });
  const context = import.meta.glob("/_context.ts", { eager: true });
  if (context['/_context.ts']) {
    const mod = context['/_context.ts']
    if ((mod as any).getContext) {
      ctx = (mod as any).getContext;
    }
  }

  const completedSchema = builder.toSchema({});

  const yoga = createYoga({
    schema: completedSchema,
    // We allow batching by default
    batching: true,
    context: ctx,
    plugins: [
      useDeferStream()
    ]
  })

  // TODO: this part is node-specific
  if (import.meta.env.PROD) {
    const server = http.createServer(yoga);
    server.listen(4000)
  } else {
    (yoga as any).stringifiedSchema = printSchema(completedSchema);
    (yoga as any).resetBuilder = resetBuilder;
    return yoga;
  }
}

main();
