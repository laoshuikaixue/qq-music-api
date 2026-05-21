import { styleText } from 'node:util';

type ColorFunction = (text: string) => string;

interface Colors {
	silly: ColorFunction;
	input: ColorFunction;
	verbose: ColorFunction;
	prompt: ColorFunction;
	info: ColorFunction;
	data: ColorFunction;
	help: ColorFunction;
	warn: ColorFunction;
	debug: ColorFunction;
	error: ColorFunction;
}

const colors: Colors = {
	silly: (text: string) => styleText('magenta', text),
	input: (text: string) => styleText('gray', text),
	verbose: (text: string) => styleText('cyan', text),
	prompt: (text: string) => styleText('white', text),
	info: (text: string) => styleText('green', text),
	data: (text: string) => styleText('gray', text),
	help: (text: string) => styleText('cyan', text),
	warn: (text: string) => styleText('yellow', text),
	debug: (text: string) => styleText('blue', text),
	error: (text: string) => styleText('red', text)
};

export default colors;
