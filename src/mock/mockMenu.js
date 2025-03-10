

export const menuData = {
  success: true,
  message:"成功",
  data: [
    {
      id: 8000,
      parentId: 0,
      name:"巡检单",
      type: 1,
      path:"pic",
      menukey:"pic",
      sort:8,
      children : [
        {
           id: 8010,
           parentId :8000,
           name:"商品图片展示",
           type: 2,
           path:"pic/pics",
           menukey:"pics",
           sort: 1
        },
      //   {
      //     id: 8030,
      //     parentId :8000,
      //     name:"商品",
      //     type: 2,
      //     path:"pic/pi",
      //     menukey:"pi",
      //     sort: 1
      //  },
        {
           id: 8020,
           parentId :8000,
           name:"巡检单列表",
           type: 2,
           path:"pic/list",
           menukey:"list" ,
           sort: 2
        },
        {
          id: 8030,
          parentId :8000,
          name:"404",
          type: 2,
          path:"*",
          menukey:"*" ,
          sort: 2
       },
      ]
    },

  ]
}

