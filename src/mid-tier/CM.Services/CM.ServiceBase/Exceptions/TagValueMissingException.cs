using System;

namespace CM.ServiceBase.Exceptions
{
    public class TagValueMissingException : Exception
    {
        public TagValueMissingException(string message, Guid disputeGuid, int assignedTemplateId, string[] tags)
            : base(message)
        {
            Tags = tags;
            DisputeGuid = disputeGuid;
            AssignedTemplateId = assignedTemplateId;
        }

        public string[] Tags { get; }

        public Guid DisputeGuid { get; }

        public int AssignedTemplateId { get; }
    }
}
