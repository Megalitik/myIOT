using System;
using System.Text;
using System.Threading.Tasks;
using System.Threading;
using Azure.Messaging.EventHubs.Consumer;
using System.Data;
using System.Linq;
using System.Data.SqlClient;

namespace ConsoleAppSimulatedIoTHubSensor
{
    class Program
    {
        private readonly static string sqlconnectionString = "Server=LAPTOP-UP41QVDN\\SQLEXPRESS;Database=MyIOT;User Id=sa;Password=Password;";
        private readonly static string eventHubConnectionString = $"Endpoint=sb://ihsuprodamres082dednamespace.servicebus.windows.net/;SharedAccessKeyName=iothubowner;SharedAccessKey=Bj6J9hRQODXMZrMFAygpaGUBqRtttOb4JspTHzNDTDc=;EntityPath=iothub-ehub-myiot-pap-24899739-4cd7aaee27";
        public static EventHubConsumerClient eventHubConsumerClient = null;
        private static async Task Main()
        {
            Console.WriteLine("Receber Mensagens do EventHub do IoT Hub\n");

            var messages = GetDeviceEventMessageAsync();

            await messages;
        }

        public static async Task GetDeviceEventMessageAsync()
        {
            string consumerGroup = EventHubConsumerClient.DefaultConsumerGroupName;


            eventHubConsumerClient = new EventHubConsumerClient(consumerGroup, eventHubConnectionString);

            // var tasks = new List<Task>();
            // var partitions = await eventHubConsumerClient.GetPartitionIdsAsync();
            // foreach (string partition in partitions)
            // {
            //     tasks.Add(ReceiveMessagesFromDeviceAsync(partition));
            // }


            await using (var consumerClient = eventHubConsumerClient)
            {
                DateTimeOffset timesamp = DateTimeOffset.UtcNow.Subtract(TimeSpan.FromMinutes(10)); // In your case this line would be DateTimeOffset timesamp = DateTimeOffset.UtcNow.Subtract(TimeSpan.FromHours(1));
                EventPosition timestamp = EventPosition.FromEnqueuedTime(timesamp);
                using CancellationTokenSource cancellationSource = new CancellationTokenSource();
                string partitionId = (await consumerClient.GetPartitionIdsAsync(cancellationSource.Token)).First();

                await foreach (PartitionEvent partitionEvent in consumerClient.ReadEventsFromPartitionAsync(
                   partitionId,
                    timestamp))
                {
                    string deviceId = partitionEvent.Data.SystemProperties["iothub-connection-device-id"].ToString();
                    string json = Encoding.UTF8.GetString(partitionEvent.Data.Body.ToArray());
                    Console.WriteLine(json);

                    using (var connection = new SqlConnection(sqlconnectionString))
                    {
                        await connection.OpenAsync();

                        string sql = "INSERT INTO [dbo].[DeviceMessages] ([deviceId],[Message],[MessageDate]) VALUES (@deviceID,@message,@date)";
                        using (SqlCommand cmd = new SqlCommand(sql, connection))
                        {
                            cmd.Parameters.Add("@deviceID", SqlDbType.Int, int.MaxValue).Value = deviceId;
                            cmd.Parameters.Add("@message", SqlDbType.VarChar, int.MaxValue).Value = json;
                            cmd.Parameters.Add("@date", SqlDbType.DateTime).Value = DateTime.Now;

                            cmd.CommandType = CommandType.Text;
                            cmd.ExecuteNonQuery();
                        }
                    }
                }
            }
        }

        public async Task ReceiveMessagesFromDeviceAsync(string partitionId)
        {
            Console.WriteLine($"Starting listener thread for partition: {partitionId}");
            while (true)
            {
                await foreach (PartitionEvent receivedEvent in eventHubConsumerClient.ReadEventsFromPartitionAsync(partitionId, EventPosition.Latest))
                {
                    string msgSource;
                    string body = Encoding.UTF8.GetString(receivedEvent.Data.Body.ToArray());
                    if (receivedEvent.Data.SystemProperties.ContainsKey("iothub-message-source"))
                    {
                        msgSource = receivedEvent.Data.SystemProperties["iothub-message-source"].ToString();
                        Console.WriteLine($"{partitionId} {msgSource} {body}");


                    }
                }
            }
        }
    }


}

