import { expectType } from 'ts-expect';
import { sanitize, Sanitized } from "./sanitize";

describe('sanitize', () => {
	it('should sanitize an object without a password', () => {
		const input = {
			name: 'Alice',
			email: 'alice@example.com',
			age: 30,
			address: {
				street: '123 Main St',
				city: 'Anytown',
				state: 'CA',
				zip: '12345'
			}
		};
		const expectedOutput = {
			name: 'Alice',
			email: 'alice@example.com',
			age: 30,
			address: {
				street: '123 Main St',
				city: 'Anytown',
				state: 'CA',
				zip: '12345'
			}
		};
		const actualOutput = sanitize(input);
		expect(actualOutput).toEqual(expectedOutput);
		expectType<Sanitized<typeof input>>(actualOutput);
	});

	it('should sanitize an object with a password', () => {
		const input = {
			name: 'Bob',
			email: 'bob@example.com',
			password: 'secret'
		};
		const expectedOutput = {
			name: 'Bob',
			email: 'bob@example.com'
		};
		const [actualOutput] = sanitize(input);
		expect(actualOutput).toEqual(expectedOutput);
		expectType<Sanitized<typeof input>>(actualOutput);
	});

	it('should sanitize an array of objects', () => {
		const input = [
			{
				name: 'Alice',
				email: 'alice@example.com'
			},
			{
				name: 'Bob',
				email: 'bob@example.com',
				password: 'secret'
			}
		];
		const expectedOutput = [
			{
				name: 'Alice',
				email: 'alice@example.com'
			},
			{
				name: 'Bob',
				email: 'bob@example.com'
			}
		];
		const [actualOutput] = sanitize(input);
		expect(actualOutput).toEqual(expectedOutput);
		expectType<Sanitized<typeof input>>(actualOutput);
	});

	it('should sanitize a nested object with a password', () => {
		const input = {
			name: 'Charlie',
			email: 'charlie@example.com',
			password: 'secret',
			friends: [
				{
					name: 'Dave',
					email: 'dave@example.com',
					password: 'hidden'
				},
				{
					name: 'Eve',
					email: 'eve@example.com'
				}
			]
		};
		const expectedOutput = {
			name: 'Charlie',
			email: 'charlie@example.com',
			friends: [
				{
					name: 'Dave',
					email: 'dave@example.com'
				},
				{
					name: 'Eve',
					email: 'eve@example.com'
				}
			]
		};
		const [actualOutput] = sanitize(input);
		expect(actualOutput).toEqual(expectedOutput);
		expectType<Sanitized<typeof input>>(actualOutput);
	});
});