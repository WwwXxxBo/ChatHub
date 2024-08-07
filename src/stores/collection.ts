import { defineStore } from 'pinia'
// 引入类型限制
import { type CollectionItemType } from "@/types"

export const useCollectionStore = defineStore({
    id: 'collection',
    state: () => ({
        collectionItemList: [] as CollectionItemType[]
    }),
    getters: {
        getStoreJson(): string {
            return JSON.stringify({
                collectionItemList: this.collectionItemList
            })
        }
    },
    actions: {
        setStoreFromJson(json: string){
            let importFlag = false
            if(!json){
                return importFlag
            }
            const collectionBackUp = JSON.parse(json)
            if(collectionBackUp.collectionItemList !== undefined){
                this.collectionItemList = collectionBackUp.collectionItemList
                importFlag = true
            }
            return importFlag
        }
    },
    persist: false
})