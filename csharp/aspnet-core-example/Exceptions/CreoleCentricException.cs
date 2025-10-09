namespace CreoleCentricExample.Exceptions;

public class CreoleCentricException : Exception
{
    public int StatusCode { get; }
    public string? ResponseBody { get; }

    public CreoleCentricException(string message, int statusCode = 500, string? responseBody = null)
        : base(message)
    {
        StatusCode = statusCode;
        ResponseBody = responseBody;
    }
}
