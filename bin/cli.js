#!/usr/bin/env node
'use strict';
const fs = require('fs');
const postcss = require('postcss');
const tailwind = require('tailwindcss');
const build = require('../utils/build');

const flags = require('../utils/cli-parse')
const path = require('path');

const source = `
@tailwind components;
@tailwind utilities;
`;

postcss([tailwind])
	.process(source, {from: undefined})
	.then(({css}) => {
		const styles = build(css, flags.rem);

    fs.writeFileSync(path.resolve(flags.outDir, 'tailwind-common.json'), JSON.stringify(styles.common, null, '\t'));
    Object.entries(styles.rems).forEach(([remSize, remStyles]) => {
			fs.writeFileSync(path.resolve(flags.outDir, `tailwind-${remSize}.json`), JSON.stringify(remStyles, null, '\t'));
		})
	})
	.catch(error => {
		console.error('> Error occurred while generating styles');
		console.error(error.stack);
		process.exit(1);
	});
