import fs from 'node:fs'

export function mkdirp(dir) {
	try {
		fs.mkdirSync(dir, {recursive: true})
	} catch (error) {
		if (error.code === 'EEXIST') {
			return
		}
		throw error
	}
}
