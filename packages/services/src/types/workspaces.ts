export interface Workspace {
  id: string;
  name: string;
  webControlStartMode: string;
  photo?: string;
  defaultSpaceName?: string;
  description?: string;
  organizationId?: string;
  organizationName?: string;
  verificationSpace: {
    authAction: string;
    authMethod: string;
  };
  spaceStyling?: {
    [key: string]: any;
  };
}
