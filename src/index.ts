import { GraphQLServer } from 'graphql-yoga'
import { Prisma } from './generated/prisma'

interface Context {
  db: Prisma
  request: any
}


const resolvers = {
  Query: {
    feed: (parent, args, ctx: Context, info ) =>{
      return ctx.db.query.posts({where: {isPublished:true}}, info)
    }, 
    drafts: (parent, args, ctx: Context, info ) =>{
      return ctx.db.query.posts({where: {isPublished:false}} ,info)
    }, 
    post: (parent, { id }, ctx: Context, info ) =>{
      return ctx.db.query.post({where: { id } } ,info)
    } 
  },
  Mutation: {
    createDraft: (parent, { title, text }, ctx: Context, info) => {
      return ctx.db.mutation.createPost({ data: { text, title, isPublished: false} }, info)
    },
    deletePost: (parent, { id }, ctx: Context, info) => {
     return ctx.db.mutation.deletePost({ where: { id } })
    },
    publish: (_, { id, text, title }, ctx: Context, info) => {
      return ctx.db.mutation.updatePost({ where: { id }, data: {isPublished:true, text, title } }, info)
    }
  }
}

const server = new GraphQLServer({
  typeDefs : './src/schema.graphql',
  resolverValidationOptions: {
    requireResolversForResolveType: false,
  },
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      endpoint: 'https://heroku-typescript-server.herokuapp.com/database/dev',
      debug: true,
    }),
  }),
})

server.start(() => console.log('Server is running on http://localhost:4000'))