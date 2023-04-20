import {copyFile, rm} from 'node:fs/promises'
import path from 'node:path'
import util from 'node:util'
import {exec} from 'node:child_process'

const _exec = util.promisify(exec)

const frontend = new Set(['svelte'])

export async function create(cwd, options) {
	const cmds = []
	const others = []

	let separator = ';'
	if (process.platform === 'win32') {
		cmds.push('cmd /c chcp 65001>nul')
		separator = ' && '
	}

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

	if (frontend.has(options.template)) {
		cmds.push('npx --yes tiged lagden/boilerplate-eslint/files/frontend#main . --force')
		fileBaseToCP = fileBaseFront
	} else {
		cmds.push('npx --yes tiged lagden/boilerplate-eslint/files/backend#main . --force')
		fileBaseToCP = fileBaseBack
	}

	if (options.features) {
		cmds.push('npx --yes tiged lagden/boilerplate-docker-nodejs/files#main . --force')
	} else if (process.platform === 'win32') {
		cmds.push(
			'del /s /q /f .rsync-*',
			'rd /s /q bin\\docker',
		)
	} else {
		cmds.push(
			'rm .rsync-*',
			'rm -rf bin/docker',
		)
	}

	if (process.platform === 'win32') {
		cmds.push(
			'del /s /q /f .gitlab-ci.yml',
			'rd /s /q .github',
		)
	} else {
		cmds.push('rm -rf .github .gitlab-ci.yml')
	}

	await _exec(cmds.join(separator))

	others.push(
		copyFile(fileBaseToCP, fileBase),
		rm(fileBaseFront, {force: true}),
		rm(fileBaseBack, {force: true}),
	)

	await Promise.all(others)
}
