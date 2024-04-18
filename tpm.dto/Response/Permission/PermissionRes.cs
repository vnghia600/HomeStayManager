using System.Collections.Generic;
using ProtoBuf;
namespace tpm.dto.admin.MBM
{
    //[Serializable]
    [ProtoContract]
    public class PermissionRes 
    {
        [ProtoMember(1)]
        public int RoleID { get; set; }
        [ProtoMember(2)]
        public string RoleFunctionName { get; set; }
        [ProtoMember(3)]
        public string APIController { get; set; }
        [ProtoMember(4)]
        public string APIAction { get; set; }
        [ProtoMember(5)]
        public string APIMethod { get; set; }
    }

    [ProtoContract]
    public class ModuleRes 
    {

        [ProtoMember(1)]
        public int RoleID { get; set; }
        [ProtoMember(2)]
        public string ModuleName { get; set; }
        [ProtoMember(3)]
        public string ModuleLink { get; set; }

    }


    [ProtoContract]
    public class ClientRes 
    {
        [ProtoMember(1)]
        public List<PermissionRes> Permission { get; set; }
        [ProtoMember(2)]
        public List<ModuleRes> Module { get; set; }
    }
}
