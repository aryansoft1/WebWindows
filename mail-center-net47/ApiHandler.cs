using System;
using System.Web;
using MailKit;
using MailKit.Net.Pop3;
using MailKit.Net.Imap;
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace WebWindows.MailCenter
{
 public sealed class ApiHandler : IHttpHandler
 {
  public bool IsReusable { get { return true; } }
  public void ProcessRequest(HttpContext c)
  {
   c.Response.ContentType="application/json; charset=utf-8"; var action=(c.Request["action"]??"health").ToLowerInvariant();
   if(action=="health"){ var health=AccountStore.HealthStatus(); Ok(c,"\"service\":\"WebWindows Mail Center\",\"mailKitVersion\":\""+typeof(IMailService).Assembly.GetName().Version+"\",\"configured\":"+(health=="ready"?"true":"false")+",\"configurationStatus\":\""+Esc(health)+"\""); return; }
   if(c.Request.HttpMethod!="POST"||c.Request.Headers["X-WebWindows-Mail-Center"]!="1"){Fail(c,403,"invalid mail center request");return;}
   var owner=c.Request.Cookies["webwindows_user"]==null?"":c.Request.Cookies["webwindows_user"].Value;
   if(String.IsNullOrWhiteSpace(owner)){ Fail(c,401,"login required"); return; }
   try {
    if(action=="account-save") { Save(c,owner); return; }
    if(action=="account-delete") { Delete(c,owner); return; }
    if(action=="accounts") { Accounts(c,owner); return; }
    if(action=="test-mailbox") { TestMailbox(c,owner); return; }
    if(action=="send") { Send(c,owner); return; }
    if(action=="inbox") { Inbox(c,owner); return; }
    if(action=="folder") { Folder(c,owner); return; }
    if(action=="message") { Message(c,owner); return; }
    if(action=="mark-read") { MarkRead(c,owner); return; }
    if(action=="move") { Move(c,owner); return; }
    Fail(c,404,"unknown action");
   } catch(Exception){ Fail(c,502,"mail center request failed"); }
  }
  static void Save(HttpContext c,string owner){ var provider=(c.Request.Form["provider"]??"").Trim().ToLowerInvariant(); var email=(c.Request.Form["email"]??"").Trim().ToLowerInvariant(); var password=c.Request.Form["appPassword"]??""; if((provider!="qq"&&provider!="gmail")||email.Length==0||email.Length>254||password.Length==0||password.Length>512){Fail(c,400,"provider, email and appPassword are required");return;} AccountStore.Save(owner,new MailAccount{Provider=provider,Email=email,DisplayName=c.Request.Form["displayName"]??email,Password=password}); Ok(c,"\"saved\":true"); }
  static void Delete(HttpContext c,string owner){ var id=c.Request.Form["accountId"]??""; if(id.Length==0){Fail(c,400,"accountId is required");return;} AccountStore.Delete(owner,id); Ok(c,"\"deleted\":true"); }
  static void Accounts(HttpContext c,string owner){var rows=AccountStore.List(owner);var json="";foreach(var a in rows){if(json.Length>0)json+=",";json+="{\"id\":\""+Esc(a.Id)+"\",\"provider\":\""+Esc(a.Provider)+"\",\"name\":\""+Esc(a.DisplayName)+"\",\"address\":\""+Esc(a.Email)+"\"}";}Ok(c,"\"accounts\":["+json+"]");}
  static string ImapHost(MailAccount a){ return a.Provider=="qq"?"imap.qq.com":"imap.gmail.com"; }
  static IMailFolder MailFolder(ImapClient client,string name){ IMailFolder folder; if(name=="sent") folder=client.GetFolder(SpecialFolder.Sent); else if(name=="trash") folder=client.GetFolder(SpecialFolder.Trash); else if(name=="inbox"||String.IsNullOrEmpty(name)) folder=client.Inbox; else throw new ArgumentException("invalid folder"); if(folder==null) throw new NotSupportedException("mail provider does not expose the requested folder"); return folder; }
  static void TestMailbox(HttpContext c,string owner){ var id=c.Request.Form["accountId"]??""; var a=AccountStore.Get(owner,id); if(a==null){Fail(c,404,"account not found");return;} using(var client=new ImapClient()){client.Timeout=30000; client.Connect(ImapHost(a),993,SecureSocketOptions.SslOnConnect);client.Authenticate(a.Email,a.Password); var count=client.Inbox.Count;client.Disconnect(true);Ok(c,"\"provider\":\""+Esc(a.Provider)+"\",\"messageCount\":"+count);}}
  static void Send(HttpContext c,string owner){ var a=AccountStore.Get(owner,c.Request.Form["accountId"]??""); if(a==null){Fail(c,404,"account not found");return;} var to=(c.Request.Form["to"]??"").Trim(); var subject=c.Request.Form["subject"]??""; var body=c.Request.Form["body"]??""; if(to.Length==0||to.Length>1024||subject.Length>998||body.Length==0||body.Length>1048576){Fail(c,400,"invalid message fields");return;} InternetAddressList recipients; if(!InternetAddressList.TryParse(to,out recipients)||recipients.Count==0){Fail(c,400,"invalid recipient address");return;} var host=a.Provider=="qq"?"smtp.qq.com":"smtp.gmail.com";var msg=new MimeMessage();msg.From.Add(new MailboxAddress(a.DisplayName,a.Email));msg.To.AddRange(recipients);msg.Subject=subject;msg.Body=new TextPart("plain"){Text=body};string id;using(var client=new SmtpClient()){client.Timeout=30000;client.Connect(host,465,SecureSocketOptions.SslOnConnect);client.Authenticate(a.Email,a.Password);id=client.Send(msg);client.Disconnect(true);}try{using(var imap=new ImapClient()){imap.Timeout=30000;imap.Connect(ImapHost(a),993,SecureSocketOptions.SslOnConnect);imap.Authenticate(a.Email,a.Password);var sent=imap.GetFolder(SpecialFolder.Sent);if(sent!=null)sent.Append(msg,MessageFlags.Seen);imap.Disconnect(true);}}catch{} Ok(c,"\"messageId\":\""+Esc(id)+"\"");}
  static string FolderJson(IMailFolder folder){ var from=Math.Max(0,folder.Count-30);var rows=folder.Fetch(from,-1,MessageSummaryItems.UniqueId|MessageSummaryItems.Envelope|MessageSummaryItems.InternalDate|MessageSummaryItems.Flags);var json="";foreach(var row in rows){if(json.Length>0)json+=",";var envelope=row.Envelope;var unread=!row.Flags.HasValue||!row.Flags.Value.HasFlag(MessageFlags.Seen);json+="{\"uid\":\""+Esc(row.UniqueId.ToString())+"\",\"read\":"+(unread?"false":"true")+",\"from\":\""+Esc(envelope==null||envelope.From==null?"":envelope.From.ToString())+"\",\"to\":\""+Esc(envelope==null||envelope.To==null?"":envelope.To.ToString())+"\",\"subject\":\""+Esc(envelope==null?"":envelope.Subject)+"\",\"date\":\""+Esc((row.InternalDate??DateTimeOffset.MinValue).ToUniversalTime().ToString("o"))+"\"}";}return json;}
  static void Inbox(HttpContext c,string owner){ Folder(c,owner,"inbox"); }
  static void Folder(HttpContext c,string owner){ Folder(c,owner,c.Request.Form["folder"]??"inbox"); }
  static void Folder(HttpContext c,string owner,string name){ var a=AccountStore.Get(owner,c.Request.Form["accountId"]??""); if(a==null){Fail(c,404,"account not found");return;}using(var client=new ImapClient()){client.Timeout=30000;client.Connect(ImapHost(a),993,SecureSocketOptions.SslOnConnect);client.Authenticate(a.Email,a.Password);var folder=MailFolder(client,name);folder.Open(FolderAccess.ReadOnly);var json=FolderJson(folder);client.Disconnect(true);Ok(c,"\"folder\":\""+Esc(name)+"\",\"messages\":["+json+"]");}}
  static void Message(HttpContext c,string owner){var a=AccountStore.Get(owner,c.Request.Form["accountId"]??"");UniqueId uid; if(a==null||!UniqueId.TryParse(c.Request.Form["uid"]??"",out uid)){Fail(c,400,"invalid message request");return;}using(var client=new ImapClient()){client.Timeout=30000;client.Connect(ImapHost(a),993,SecureSocketOptions.SslOnConnect);client.Authenticate(a.Email,a.Password);var folder=MailFolder(client,c.Request.Form["folder"]??"inbox");folder.Open(FolderAccess.ReadWrite);var msg=folder.GetMessage(uid);folder.AddFlags(uid,MessageFlags.Seen,true);client.Disconnect(true);Ok(c,"\"from\":\""+Esc(msg.From.ToString())+"\",\"subject\":\""+Esc(msg.Subject)+"\",\"date\":\""+Esc(msg.Date.ToString("o"))+"\",\"body\":\""+Esc(msg.TextBody??msg.HtmlBody??"")+"\"");}}
  static void MarkRead(HttpContext c,string owner){var a=AccountStore.Get(owner,c.Request.Form["accountId"]??"");UniqueId uid;if(a==null||!UniqueId.TryParse(c.Request.Form["uid"]??"",out uid)){Fail(c,400,"invalid state request");return;}using(var client=new ImapClient()){client.Timeout=30000;client.Connect(ImapHost(a),993,SecureSocketOptions.SslOnConnect);client.Authenticate(a.Email,a.Password);var folder=MailFolder(client,c.Request.Form["folder"]??"inbox");folder.Open(FolderAccess.ReadWrite);folder.AddFlags(uid,MessageFlags.Seen,true);client.Disconnect(true);}Ok(c,"\"read\":true");}
  static void Move(HttpContext c,string owner){var a=AccountStore.Get(owner,c.Request.Form["accountId"]??"");UniqueId uid;var from=c.Request.Form["fromFolder"]??"inbox";var target=c.Request.Form["toFolder"]??"trash";if(a==null||!UniqueId.TryParse(c.Request.Form["uid"]??"",out uid)){Fail(c,400,"invalid move request");return;}using(var client=new ImapClient()){client.Timeout=30000;client.Connect(ImapHost(a),993,SecureSocketOptions.SslOnConnect);client.Authenticate(a.Email,a.Password);var source=MailFolder(client,from);var destination=MailFolder(client,target);source.Open(FolderAccess.ReadWrite);source.MoveTo(uid,destination);client.Disconnect(true);}Ok(c,"\"moved\":true");}
  static void Ok(HttpContext c,string extra){c.Response.Write("{\"ok\":true,"+extra+"}");}
  static void Fail(HttpContext c,int status,string text){c.Response.StatusCode=status;c.Response.Write("{\"ok\":false,\"error\":\""+Esc(text)+"\"}");}
  static string Esc(string s){return (s??"").Replace("\\","\\\\").Replace("\"","\\\"").Replace("\r"," ").Replace("\n"," ");}
 }
}
