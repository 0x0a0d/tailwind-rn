const meow = require('meow');
const path = require('path');
const fs = require('fs');

const cli = meow(`
  Usage
    $ create-tailwind-rn -r 12 -r 16 -r 20

  Options
    --rem, -r        rem size in pixel (default: 16)
    --outDir, -o    path of output dir (default: process.cwd())
`, {
  flags: {
    rem: {
      type: 'number',
      alias: 'r',
      default: [16],
			isMultiple: true
    },
		outDir: {
      type: 'string',
      alias: 'o',
      default: process.cwd(),
    }
  }
});

const flags = {...cli.flags}

flags.outDir = path.resolve(process.cwd(), flags.outDir)

if (!fs.existsSync(flags.outDir)) {
	throw new Error(`outDir '${flags.outDir}' does not exist!`)
}

module.exports = flags
