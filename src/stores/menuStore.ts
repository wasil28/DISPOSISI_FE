// File: src/stores/menuStore.js
import { defineStore } from 'pinia'
import type { menuAside, menuStore } from '~/types/storeTypes'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menuItems: [],
  }),

  actions: {
    setMenuItems(menuData: menuStore[]) {
      const transformedMenu = this.transformMenuData(menuData)
      this.menuItems = transformedMenu
    },

    transformMenuData(menuData: menuStore[]) {
      // Fungsi untuk mencari anak berdasarkan parentId
      const findChildren = (items: menuStore[], parentId: number) => {
        return items.filter((item: menuStore) => item.pid === parentId && item.allowview === 1)
          .map((item: menuStore) => {
            const transformedItem: menuAside = {
              label: item.name,
              icon: item.icon,
              menu: [],
              to: '',
              allow_view: item.allowview,
              allow_new: item.allownew,
              allow_edit: item.allowedit,
              allow_delete: item.allowdelete,
              allow_download: item.allowdownload,
              allow_approve: item.allowapprove,
            }
            const childrenLength = findChildren(items, item.moduleid).length

            // Mengecek apakah item memiliki anak
            if (childrenLength > 0)
              transformedItem.menu = findChildren(items, item.moduleid)
            else
              transformedItem.to = item.url

            return transformedItem
          })
      }

      // Mencari menu utama dengan parentId 0
      const transformedMenu = findChildren(menuData, 0)

      return transformedMenu
    },
  },

  getters: {
    getMenuItems() {
      return this.menuItems
    },
  },
})
