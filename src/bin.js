#!/usr/bin/env node

import process from 'node:process'
import fs from 'node:fs'
import path from 'node:path'
import {readFile} from 'node:fs/promises'
import * as p from '@clack/prompts'
import {bold, cyan, grey, red} from 'kleur/colors'
import {create} from './cli.js'

const {name, version} = JSON.parse(await readFile(new URL('../package.json', import.meta.url), {encoding: 'utf8'}))
let cwd = process?.argv?.[2] ?? '.'

console.log(`
${grey(`${name} version ${version}`)}
`)

p.intro('Welcome to initialization program.')

if (cwd === '.') {
	const dir = await p.text({
		message: 'Where should we create your project?',
		placeholder: '  (hit Enter to use current directory)',
	})

	if (p.isCancel(dir)) {
		process.exit(1)
	}

	if (dir) {
		cwd = dir
	}
}

if (fs.existsSync(cwd) && fs.readdirSync(cwd).length > 0) {
	const force = await p.confirm({
		message: 'Directory is not empty. Continue?',
		initialValue: false,
	})

	// bail if `force` is `false` or the user cancelled with Ctrl-C
	if (force !== true) {
		process.exit(1)
	}
}

const options = await p.group(
	{
		template: () =>
			p.select({
				message: 'Which app template?',
				options: [
					{
						label: 'API REST',
						value: 'rest',
					},
					{
						label: 'API GraphQL Koa',
						value: 'gql',
					},
					{
						label: 'API GraphQL Yoga',
						value: 'gql-yoga',
					},
					{
						label: 'Websocket Server',
						value: 'ws',
					},
					{
						label: 'Svelte App',
						value: 'svelte',
					},
				],
			}),

		features: () =>
			p.select({
				message: 'Choose your stack:',
				options: [
					{
						label: 'Add Docker Compose and Dockerfile',
						value: 1,
					},
					{
						label: 'Only Dockerfile',
						value: 2,
					},
					{
						label: 'Without Docker stuff',
						value: 3,
					},
				],
			}),

		cicd: () =>
			p.multiselect({
				message: 'Choose the CI/CD options:',
				options: [
					{
						label: 'GitHub',
						value: 'github',
					},
					{
						label: 'GitLab',
						value: 'gitlab',
					},
				],
				required: false,
			}),
	},
	{
		onCancel: () => process.exit(1),
	},
)

const s = p.spinner()
s.start('Creating...')

let fail = false

try {
	await create(cwd, {
		name: path.basename(path.resolve(cwd)),
		template: options.template,
		features: options.features,
		cicd: options.cicd,
	})
} catch (error) {
	console.error(error)
	fail = true
} finally {
	s.stop('Creating...')
	if (fail) {
		p.outro(`${bold(red('Creation failure!'))}`)
		process.exit(1)
	}
}

p.outro('Your project is ready!')

console.log('\nNext steps:')
let i = 1

const relative = path.relative(process.cwd(), cwd)
if (relative !== '') {
	console.log(`  ${i++}: ${bold(cyan(`cd ${relative}`))}`)
}

console.log(`  ${i++}: ${bold(cyan('bin/node/zera'))} (or bin/node/zera -m pnpm)`)
console.log(`  ${i++}: ${bold(cyan('git init && git add -A && git commit -m "Initial commit"'))} (optional)`)
console.log(`  ${i++}: ${bold(cyan('bin/local/start'))}`)

console.log(`\nTo close the dev server, hit ${bold(cyan('Ctrl-C'))}`)
console.log(`\nStuck? Open a discussion at ${cyan('https://github.com/lagden/boilerplate-create/discussions')}`)
