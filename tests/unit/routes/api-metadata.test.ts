import { apiMetadata, apiMetadataPaths } from '../../../src/routes/api-metadata';
import router from '../../../src/routes/router';

const getRoutePaths = () => {
	const stack = (router as unknown as { stack: Array<{ path: string }> }).stack;
	return new Set(stack.map(layer => layer.path));
};

describe('routes/api-metadata', () => {
	test('should keep metadata paths in sync with registered routes', () => {
		const routePaths = getRoutePaths();

		for (const metadataPath of apiMetadataPaths) {
			expect(routePaths.has(metadataPath)).toBe(true);
		}
	});

	test('should avoid duplicate method and path entries', () => {
		const keys = apiMetadata.map(item => `${item.method} ${item.path}`);
		expect(new Set(keys).size).toBe(keys.length);
	});
});
