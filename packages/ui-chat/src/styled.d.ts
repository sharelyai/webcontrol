import 'styled-components';
import { defaultTheme } from '@sharelyai/ui-shared';

type Theme = typeof defaultTheme;

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
