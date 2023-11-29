import {copyFile, rm} from 'node:fs/promises'
import path from 'node:path'
import {promisify} from 'node:util'
import {exec} from 'node:child_process'

const _exec = promisify(exec)

const frontend = new Set(['svelte'])

export async function create(cwd, options) {
	const cmds = []
	const others = []

	let separator = ';'
	if (process.platform === 'win32') {
		cmds.push('cmd /c chcp 65001>nul')
		separator = ' && '
	}

	// prettier-ignore
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

	const fileDevelopment = path.join(cwd, '.conf', 'development.sh')
	const fileDevelopmentFront = path.join(cwd, '.conf', 'development.front.sh')
	const fileDevelopmentBack = path.join(cwd, '.conf', 'development.back.sh')
	let fileDevelopmentToCP

	if (frontend.has(options.template)) {
		cmds.push('npx --yes tiged lagden/boilerplate-eslint/files/frontend#main . --force')
		fileBaseToCP = fileBaseFront
		fileDevelopmentToCP = fileDevelopmentFront
	} else {
		cmds.push('npx --yes tiged lagden/boilerplate-eslint/files/backend#main . --force')
		fileBaseToCP = fileBaseBack
		fileDevelopmentToCP = fileDevelopmentBack
	}

	if ([1, 2].includes(options.features)) {
		cmds.push('npx --yes tiged lagden/boilerplate-docker-nodejs/files#main . --force')
		if (options.features === 2) {
			if (process.platform === 'win32') {
				cmds.push('del /s /q /f .rsync-*', 'del /s /q /f docker-compose*')
			} else {
				cmds.push('rm .rsync-*', 'rm docker-compose*')
			}
		}

		if (frontend.has(options.template)) {
			if (process.platform === 'win32') {
				cmds.push('del /s /q /f Dockerfile', 'ren Dockerfile.frontend Dockerfile')
			} else {
				cmds.push('rm Dockerfile', 'mv Dockerfile.frontend Dockerfile')
			}
		} else {
			if (process.platform === 'win32') {
				cmds.push('del /s /q /f Dockerfile.frontend')
			} else {
				cmds.push('rm Dockerfile.frontend')
			}
		}
	}

	if (options.cicd.includes('github') === false) {
		if (process.platform === 'win32') {
			cmds.push('rd /s /q .github')
		} else {
			cmds.push('rm -rf .github')
		}
	}

	if (options.cicd.includes('gitlab') === false) {
		if (process.platform === 'win32') {
			cmds.push('del /s /q /f .gitlab-ci.yml values.y*')
		} else {
			cmds.push('rm -rf .gitlab-ci.yml values.y*')
		}
	}

	await _exec(cmds.join(separator))

	// prettier-ignore
	others.push(
		copyFile(fileBaseToCP, fileBase),
		rm(fileBaseFront, {force: true}),
		rm(fileBaseBack, {force: true}),
		copyFile(fileDevelopmentToCP, fileDevelopment),
		rm(fileDevelopmentFront, {force: true}),
		rm(fileDevelopmentBack, {force: true}),
	)

	await Promise.all(others)
}
