// ─────────────────────────────────────────────────────────────────────────
// Cliente Supabase FALSO para o MODO DEMO (sem env configurado, fora de prod).
// O design da plataforma é "degradar com elegância": sem Supabase, as telas
// renderizam vazias em vez de estourar 500. Como o data layer SEMPRE chama
// createClient().from(...), aqui devolvemos um stub encadeável que resolve
// para { data: [], error: null } (ou { data: null } em maybeSingle/single).
// Nenhuma escrita acontece; auth.getUser() devolve user nulo.
// ─────────────────────────────────────────────────────────────────────────

function result(single: boolean) {
  return Promise.resolve({ data: single ? null : [], error: null, count: 0 })
}

// Query builder encadeável: qualquer filtro/modificador retorna a si mesmo;
// é "thenable", então `await db.from(...).select(...)` resolve vazio.
function makeQuery(single = false): any {
  const q: any = {
    then: (resolve: any, reject: any) => result(single).then(resolve, reject),
    select: () => makeQuery(single),
    insert: () => makeQuery(single),
    update: () => makeQuery(single),
    upsert: () => makeQuery(single),
    delete: () => makeQuery(single),
    eq: () => makeQuery(single),
    neq: () => makeQuery(single),
    in: () => makeQuery(single),
    is: () => makeQuery(single),
    gt: () => makeQuery(single),
    gte: () => makeQuery(single),
    lt: () => makeQuery(single),
    lte: () => makeQuery(single),
    like: () => makeQuery(single),
    ilike: () => makeQuery(single),
    or: () => makeQuery(single),
    not: () => makeQuery(single),
    contains: () => makeQuery(single),
    order: () => makeQuery(single),
    limit: () => makeQuery(single),
    range: () => makeQuery(single),
    maybeSingle: () => makeQuery(true),
    single: () => makeQuery(true),
  }
  return q
}

const demoChannel: any = {
  on: () => demoChannel,
  subscribe: () => demoChannel,
  unsubscribe: () => Promise.resolve("ok"),
}

export function createDemoClient(): any {
  const client: any = {
    from: () => makeQuery(),
    schema: () => client,
    rpc: () => makeQuery(),
    channel: () => demoChannel,
    removeChannel: () => {},
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: { message: "Indisponível no modo demonstração." },
      }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    },
  }
  return client
}
