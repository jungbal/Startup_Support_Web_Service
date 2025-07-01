import { create } from 'zustand';

const useCommercialStore = create(function(set) {
  return {
    largeList: [],
    middleList: [],
    smallList: [],

    selectedLargeCode: '',
    selectedMediumCode: '',
    selectedSmallCode: '',

    keyword: '',
    storeList: [],

    setLargeList: function(list) {
      set({ largeList: list });
    },
    setMiddleList: function(list) {
      set({ middleList: list });
    },
    setSmallList: function(list) {
      set({ smallList: list });
    },

    setSelectedLargeCode: function(code) {
      set({ selectedLargeCode: code });
    },
    setSelectedMediumCode: function(code) {
      set({ selectedMediumCode: code });
    },
    setSelectedSmallCode: function(code) {
      set({ selectedSmallCode: code });
    },

    setKeyword: function(word) {
      set({ keyword: word });
    },
    setStoreList: function(list) {
      set({ storeList: list });
    },
  };
});

export default useCommercialStore;
