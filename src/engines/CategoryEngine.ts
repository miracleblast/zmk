export interface Category {
  id: string
  name: string
  icon: string
  subcategories?: Category[]
}

export class CategoryEngine {
  private categories: Category[] = [
    {
      id: 'technology',
      name: 'Technology',
      icon: 'material-symbols:code',
      subcategories: [
        { id: 'software', name: 'Software Development', icon: 'material-symbols:code' },
        { id: 'hardware', name: 'Hardware', icon: 'material-symbols:computer' },
        { id: 'ai', name: 'Artificial Intelligence', icon: 'material-symbols:smart-toy' }
      ]
    },
    {
      id: 'import-export',
      name: 'Import/Export',
      icon: 'material-symbols:airplane-ticket',
      subcategories: [
        { id: 'electronics', name: 'Electronics', icon: 'material-symbols:devices' },
        { id: 'textiles', name: 'Textiles', icon: 'material-symbols:checkroom' },
        { id: 'agriculture', name: 'Agriculture', icon: 'material-symbols:agriculture' }
      ]
    }
  ]

  getAllCategories(): Category[] {
    return this.categories
  }

  getCategoryById(id: string): Category | undefined {
    return this.findCategoryRecursive(this.categories, id)
  }

  private findCategoryRecursive(categories: Category[], id: string): Category | undefined {
    for (const category of categories) {
      if (category.id === id) return category
      if (category.subcategories) {
        const found = this.findCategoryRecursive(category.subcategories, id)
        if (found) return found
      }
    }
    return undefined
  }
}