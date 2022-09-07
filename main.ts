import SchemaBuilder from "https://esm.sh/@pothos/core@3.20.0";
import ScopeAuthPlugin from "https://esm.sh/@pothos/plugin-scope-auth@3.13.0";
import {
  createServer,
  YogaInitialContext,
} from "https://esm.sh/@graphql-yoga/common@2.12.1";
import { serve } from "https://deno.land/std@0.154.0/http/server.ts";

const builder = new SchemaBuilder<{
  Context: YogaInitialContext;
  DefaultFieldNullability: true;
  AuthScopes: {
    user: boolean;
  };
}>({
  plugins: [ScopeAuthPlugin],
  defaultFieldNullability: true,
  authScopes: (context) => ({
    user: Boolean(context.request.headers.get("Authorization")),
  }),
});

interface User {
  name: string;
  email: string;
  id: number;
}

const User = builder.objectRef<User>("User").implement({
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    email: t.exposeString("email"),
  }),
});

builder.queryType({
  fields: (t) => ({
    me: t.field({
      type: User,
      authScopes: {
        user: true,
      },
      resolve: () => ({ id: 0, name: "John Smith", email: "john@smith.com" }),
    }),
  }),
});

const schema = builder.toSchema({})


// make typescript happy
declare global {
  type WindowOrWorkerGlobalScope = typeof window;
}

const server = createServer({ schema, maskedErrors: false });



serve((req) => server.fetch(req));
