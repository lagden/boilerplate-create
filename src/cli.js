import util from 'node:util'
import {exec} from 'node:child_process'
import {mkdirp} from './utils.js'

const _exec = util.promisify(exec)

const frontend = new Set(['svelte'])

export async function create(cwd, options) {
	mkdirp(cwd)
	const cmds = []
	cmds.push(
		`npx --yes tiged lagden/boilerplate-${options.template}#main ${cwd} --force`,
		`cd ${cwd}`,
		'npx --yes tiged lagden/boilerplate-bin/files#main bin --force',
		'npx --yes tiged lagden/boilerplate-envs/files#main .conf --force',
	)

	if (frontend.has(options.template)) {
		cmds.push('npx --yes tiged lagden/boilerplate-eslint/files/frontend#main . --force')
	} else {
		cmds.push('npx --yes tiged lagden/boilerplate-eslint/files/backend#main . --force')
	}

	if (options.features) {
		cmds.push('npx --yes tiged lagden/boilerplate-docker-nodejs/files#main . --force')
	} else {
		cmds.push(
			'rm .rsync-*',
			'rm -rf bin/docker',
		)
	}

	cmds.push('rm -rf .github .gitlab-ci.yml')

	await _exec(cmds.join(';'))
}
