// 权限设置
let permissions = sessionStorage.getItem("permissions");
export const getPermissionValues = () => {
  let permissionsArray = permissions.split(",");
  let values = permissionsArray.map(item => Number(item.split("-")[1]));
  return values;
}



