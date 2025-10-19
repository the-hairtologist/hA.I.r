/**
 * Webpack Magic Comments Type Declarations
 * Enables TypeScript support for webpack's import() magic comments
 */

/**
 * Import function with webpack magic comment support
 */
interface ImportCallOptions {
  webpackChunkName?: string;
  webpackMode?: 'lazy' | 'lazy-once' | 'eager' | 'weak';
  webpackPrefetch?: boolean | number;
  webpackPreload?: boolean | number;
}
