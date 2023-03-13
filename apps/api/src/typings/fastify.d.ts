export {}

declare module 'fastify' {
  interface FastifyRequest {
    incomingFiles: import('@fastify/multipart').MultipartFile[]
    incomingFile: import('@fastify/multipart').MultipartFile
  }
}
