export function findPipe(pipeOverlap, name) {
  let pipeName = ''
  

  for (let i = 0;; i++) {
    const char = pipeOverlap[i]

    if (char && !charIsGapOrLineBreak(char)) pipeName += char
    else if (pipeName.length) {
      const foundPipe = frameworkPipes.find(pipe => ~pipe.names.indexOf(pipeName))
      if (!foundPipe) throw new Error(`The pipe ${pipeName} is not available in ${name}.`)

      const foundArgs = findArgumentsForPipe(pipeOverlap.slice(i))
      return (args => (state => foundPipe.fn(state, ...args)))(foundArgs[0] !== '' ? foundArgs : [])
    }
  }
}

function findArgumentsForPipe(argumentsOverlap) {
  return argumentsOverlap.split(':').map(arg => arg.trim())
}

const frameworkPipes = [{
  names: ['add', '+'],
  fn: (...args) => {
    let result = Number(args[0])
    for (let i = 1; i < args.length; i++) {
      result += Number(args[i])
    }

    return result
  }
}, {
  names: ['subtract', '-'],
  fn: (...args) => {
    let result = Number(args[0])
    for (let i = 1; i < args.length; i++) {
      result -= Number(args[i])
    }

    return result
  }
}, {
  names: ['multiply', '*'],
  fn: (...args) => {
    let result = Number(args[0])
    for (let i = 1; i < args.length; i++) {
      result *= Number(args[i])
    }

    return result
  }
}, {
  names: ['divide', '/'],
  fn: (...args) => {
    let result = Number(args[0])
    for (let i = 1; i < args.length; i++) {
      result /= Number(args[i])
    }

    return result
  }
}, {
  names: ['power', '**'],
  fn: (...args) => {
    let result = Number(args[0])
    for (let i = 1; i < args.length; i++) {
      result **= Number(args[i])
    }

    return result
  }
}, {
  names: ['uppercase', 'up'],
  fn: (...args) => {
    if (args.length > 1) {
      const arrayOfChars = args[0].split('')
      for (let i = 1; i < args.length; i++) {
        const arg = Number(args[i])
        arrayOfChars[arg] = arrayOfChars[arg].toUpperCase() 
      }

      return arrayOfChars.join('')
    } else {
      return args[0].toUpperCase()
    }
  }
}, {
  names: ['lowercase', 'low'], 
  fn: (...args) => {
    if (args.length > 1) {
      const arrayOfChars = args[0].split('')
      for (let i = 1; i < args.length; i++) {
        const arg = Number(args[i])
        arrayOfChars[arg] = arrayOfChars[arg].toLowerCase() 
      }

      return arrayOfChars.join('')
    } else {
      return args[0].toLowerCase()
    }
  }
}]
const charIsGapOrLineBreak = char => char === ' ' || char === '\n'


