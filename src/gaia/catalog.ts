// GAIA: Build the bounded, data-only catalog exposed to the parent shell.
export interface CatalogTool {
  path: string
  name: string
  description: string
  category: string
  keywords: string[]
  isNew: boolean
  icon?: string
}

type RegistryTool = Omit<CatalogTool, 'category' | 'icon'> & { category: string; icon?: unknown };

function componentName(icon: unknown): unknown {
  if ((typeof icon === 'object' && icon !== null) || typeof icon === 'function') {
    return (icon as { name?: unknown }).name;
  }
  return undefined;
}

export function buildCatalog(input: RegistryTool[]): CatalogTool[] {
  return input.slice(0, 300).flatMap((tool) => {
    if (!/^\/[a-z0-9-]+$/.test(tool.path) || tool.name.length < 1 || tool.name.length > 80
      || tool.description.length > 300 || tool.category.length < 1 || tool.category.length > 60
      || tool.keywords.length > 30 || tool.keywords.some(keyword => keyword.length > 40)) { return []; }
    const iconName = componentName(tool.icon);
    const icon = typeof iconName === 'string' && /^[A-Za-z0-9]{1,40}$/.test(iconName) ? iconName : undefined;
    return [{
      path: tool.path,
      name: tool.name,
      description: tool.description,
      category: tool.category,
      keywords: tool.keywords.slice(),
      isNew: tool.isNew,
      ...(icon ? { icon } : {}),
    }];
  });
}
