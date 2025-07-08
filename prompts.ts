// This file resolves a module name collision with the `prompts/` directory
// by acting as an explicit re-exporter for the main barrel file.
export * from './prompts/index';
