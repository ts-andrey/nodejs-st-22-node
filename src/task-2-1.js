const { stdin, stdout } = require('process');

async function transform() {
  stdout.write(`Input:\n`);
  stdin.on('data', data => {
    stdout.write(`Output:`);
    stdout.write(`${data.reverse()}\n\n`);
    stdout.write(`Input:\n`);
  });
}

transform();
