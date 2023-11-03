import { InferResolvers, g } from 'garph'

const queryType = g.type('Query', {
  alphabet: g.string().list().description(`This field can be @stream'ed`),
  fastField: g.string().description('A field that resolves fast.'),
  slowField: g
    .string()
    .optional()
    .description(
      'A field that resolves slowly. Maybe you want to @defer this field ;)'
    )
    .args({
      waitFor: g.int().default(5000),
    })
})

const wait = (time: number) => new Promise(resolve => setTimeout(resolve, time))

export const resolvers: InferResolvers<{ Query: typeof queryType }, {}> = {
  Query: {
    async *alphabet() {
      for (const character of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) {
        yield character
        await wait(1000)
      }
    },
    fastField: async () => {
      await wait(100)
      return 'I am speed'
    },
    slowField: async (_, { waitFor }) => {
      await wait(waitFor)
      return 'I am slow'
    }
  }
}
