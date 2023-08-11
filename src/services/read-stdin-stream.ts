// There is an issue about how to pipe:
// https://github.com/oclif/oclif/issues/245#issuecomment-604499015

const readPipe: () => Promise<string | undefined> = () => {
  return new Promise(resolve => {
    const stdin = process.openStdin()
    stdin.setEncoding('utf-8')

    let data = ''
    stdin.on('data', chunk => {
      data += chunk
    })

    stdin.on('end', () => {
      resolve(data)
    })

    //if (stdin.isTTY) {
    //  //resolve('')
    //}
  })
}

export default readPipe
