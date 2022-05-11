namespace CM.Data.Model;

public class OutcomeDocContent : BaseEntity
{
    public int OutcomeDocContentId { get; set; }

    public int OutcomeDocFileId { get; set; }

    public OutcomeDocFile OutcomeDocFile { get; set; }

    public byte ContentType { get; set; }

    public byte? ContentSubType { get; set; }

    public byte? ContentStatus { get; set; }

    public string StoredContent { get; set; }

    public bool? IsDeleted { get; set; }
}