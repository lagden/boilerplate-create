import {copyFile, rm} from 'node:fs/promises'
import path from 'node:path'
import util from 'node:util'
import {exec} from 'node:child_process'
import {mkdirp} from './utils.js'

const _exec = util.promisify(exec)

const frontend = new Set(['svelte'])

export async function create(cwd, options) {
	const cmds = []
	const others = []

	mkdirp(cwd)
	cmds.push(
		`npx --yes tiged lagden/boilerplate-${options.template}#main ${cwd} --force`,
		`cd ${cwd}`,
		'npx --yes tiged lagden/boilerplate-bin/files#main bin --force',
		'npx --yes tiged lagden/boilerplate-envs/files#main .conf --force',
	)

	const fileBase = path.join(cwd, '.conf', 'base.sh')
	const fileBaseFront = path.join(cwd, '.conf', 'base.front.sh')
	const fileBaseBack = path.join(cwd, '.conf', 'base.back.sh')
	let fileBaseToCP

	// const dockerTemplate = path.join(cwd, 'docker-compose.template.yml')
	// const dockerTemplateFront = path.join(cwd, 'docker-compose.template.front.yml')
	// const dockerTemplateBack = path.join(cwd, 'docker-compose.template.back.yml')
	// let dockerTemplateToCP

	if (frontend.has(options.template)) {
		cmds.push('npx --yes tiged lagden/boilerplate-eslint/files/frontend#main . --force')
		fileBaseToCP = fileBaseFront
		// dockerTemplateToCP = dockerTemplateFront
	} else {
		cmds.push('npx --yes tiged lagden/boilerplate-eslint/files/backend#main . --force')
		fileBaseToCP = fileBaseBack
		// dockerTemplateToCP = dockerTemplateBack
	}

	if (options.features) {
		cmds.push('npx --yes tiged lagden/boilerplate-docker-nodejs/files#main . --force')
		// others.push(
		// 	copyFile(dockerTemplateToCP, dockerTemplate),
		// 	rm(dockerTemplateFront, {force: true}),
		// 	rm(dockerTemplateBack, {force: true}),
		// )
	} else {
		cmds.push(
			'rm .rsync-*',
			'rm -rf bin/docker',
		)
	}

	cmds.push('rm -rf .github .gitlab-ci.yml')

	await _exec(cmds.join(';'))

	others.push(
		copyFile(fileBaseToCP, fileBase),
		rm(fileBaseFront, {force: true}),
		rm(fileBaseBack, {force: true}),
	)

	await Promise.all(others)
}