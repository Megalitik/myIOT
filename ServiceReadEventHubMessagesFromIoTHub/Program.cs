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


            await using (var consumerClient = eventHubConsumerClient)
            {
                DateTimeOffset lastTenMinuteMessages = DateTimeOffset.UtcNow.Subtract(TimeSpan.FromMinutes(10));
                EventPosition timestamp = EventPosition.FromEnqueuedTime(lastTenMinuteMessages);
                using CancellationTokenSource cancellationSource = new CancellationTokenSource();
                string partitionId = (await consumerClient.GetPartitionIdsAsync(cancellationSource.Token)).First();

                await foreach (PartitionEvent partitionEvent in consumerClient.ReadEventsFromPartitionAsync(
                   partitionId,
                    timestamp))
                {
                    //Obter o ID do dispositivo
                    string deviceId = partitionEvent.Data.SystemProperties["iothub-connection-device-id"].ToString();
                    DateTime messageDate = Convert.ToDateTime(partitionEvent.Data.SystemProperties["iothub-enqueuedtime"].ToString());
                    //Mensagem do dispositivo
                    string json = Encoding.UTF8.GetString(partitionEvent.Data.Body.ToArray());
                    Console.WriteLine("Dispositivo: " + deviceId + " | Data: " + messageDate.ToString() + " | Mensagem: " +json);

                    //Guardar na Base de dados a mensagem do dispositivo
                    using (var connection = new SqlConnection(sqlconnectionString))
                    {
                        await connection.OpenAsync();

                        string sql = "INSERT INTO [dbo].[DeviceMessages] ([deviceId],[Message],[MessageDate]) VALUES (@deviceID,@message,@date)";
                        using (SqlCommand cmd = new SqlCommand(sql, connection))
                        {
                            cmd.Parameters.Add("@deviceID", SqlDbType.Int, int.MaxValue).Value = deviceId;
                            cmd.Parameters.Add("@message", SqlDbType.VarChar, int.MaxValue).Value = json;
                            cmd.Parameters.Add("@date", SqlDbType.DateTime).Value = messageDate;

                            cmd.CommandType = CommandType.Text;
                            cmd.ExecuteNonQuery();
                        }
                    }
                }
            }
        }
    }
}

