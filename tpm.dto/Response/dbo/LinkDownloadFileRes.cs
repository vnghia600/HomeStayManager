using Core.DTO;
using ProtoBuf;
using System;

namespace CCI.DTO.CRMP.Response
{
    [ProtoContract]
    public class LinkDownloadFileRes : BaseDTO, IComparable
    {
        int IComparable.CompareTo(object obj)
        {
            throw new NotImplementedException();
        }
        [ProtoMember(1)]
        public int ID { get; set; }
        [ProtoMember(2)]
        public string UrlOrigin { get; set; }
        [ProtoMember(3)]
        public string UrlHash { get; set; }
        [ProtoMember(4)]
        public DateTime? GenerationTime { get; set; }
        [ProtoMember(5)]
        public DateTime? ExpiryTime { get; set; }
    }
}
