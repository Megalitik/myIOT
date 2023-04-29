#include <WiFi.h>
#include <WiFiClient.h>
#include <WebServer.h>
#include <ESP32httpUpdate.h>
#include <ArduinoJson.h>
#include "AzureIotHub.h"
#include "Esp32MQTTClient.h"
#include "EEPROM.h"

int INTERVAL = 10000;
char deviceIDmac[23];
#define DEVICE_TYPE "Relay"
#define MESSAGE_MAX_LEN 256
#define LED 2
#define BUTTON_PIN 0

#define RELAY1 26
#define RELAY2 25
#define RELAY3 33
#define RELAY4 32



//----------------------Device Config---------------------------------------------
const char* deviceVersion = "1.0.0.22";
uint64_t deviceID;

const char* ssid = "";
const char* password = "";

static const char* connectionString;

const char *messageData = "{\"deviceID\":\"%s\", \"deviceTipo\":\"%s\", \"data\":{\"Relay1\":\"%d\", \"Relay2\":\"%d\", \"Relay3\":\"%d\", \"Relay4\":\"%d\"}}";

int messageCount = 1;
static bool hasWifi = false;
static bool messageSending = true;
static uint64_t send_interval_ms;
int networkLoss;

//testing
int len = 0;
//end testing
String JSON;
int EEaddress = 0;
//var web server ->
const char* devicePassword = "123qwe,.-";
bool isServer;
String AuxSSID;
String AuxPASS;
String AuxAzureCon;
String isOK;

String Redes[10];

WebServer server(80);

String selected =
  "<script>"
  "function show_selected() {"
  "    var selector = document.getElementById('cbPais');"
  "    var value = selector[selector.selectedIndex].value;"
  "    document.getElementById('display').innerHTML = value;"
  "}"
  "document.getElementById('btn').addEventListener('click', show_selected);;"
  "</script>";

String teste =
  "        <div id=display style='display:none'></div>"
  "        <script>show_selected</script>";
/* Style */
String style =
  "<script>"
  "   function someFunction()"
  "   }"
  "     var option = document.getElementById('cbPais').value;"
  "   }"
  "</script>"
  "<style>#file-input,input{width:100%;height:44px;border-radius:4px;margin:10px auto;font-size:15px}"
  "select{background: #f1f1f1;padding: 0 15px;border: 1px solid #ddd;line-height: 44px;text-align: left;display: block;cursor: pointerwidth: 100%;height: 44px;border-radius: 4px;margin: 10px auto;font-size: 15px}"
  "input{background:#f1f1f1;border:0;padding:0 15px}body{background:#3498db;font-family:sans-serif;font-size:14px;color:#777}"
  "#file-input{padding:0;border:1px solid #ddd;line-height:44px;text-align:left;display:block;cursor:pointer}"
  "#bar,#prgbar{background-color:#f1f1f1;border-radius:10px}#bar{background-color:#3498db;width:0%;height:10px}"
  "form{background:#fff;max-width:258px;margin:75px auto;padding:30px;border-radius:5px;text-align:center}"
  ".btn{background:#3498db;color:#fff;cursor:pointer}</style>";


// Utilities
bool ReadEEPROM() {

  StaticJsonDocument<512> jsonDocument;
  //TESTING EEPROM
  String json = "";
  char arr[3];
  char const* ch;
  int asc = 0;
  JsonObject* conf;
  EEPROM.begin(512);
  for (int i = 0; i < 512; ++i)
  {
    char c = char(EEPROM.read(i));
    if (c != 0)
    {
      json += c;
      delay(1);
    }
    else
    {
      break;
    }
  }


  Serial.println(json);
  deserializeJson(jsonDocument, json);

  serializeJson(jsonDocument, Serial);
  //TESTING EEPROM

  //deserializeJson(jsonDocument, json);

  ssid = jsonDocument["ssid"];//(char *) ggg .as<String>().c_str();
  password = jsonDocument["password"];
  deviceVersion = jsonDocument["version"];
  connectionString = jsonDocument["iothub"];
  INTERVAL = jsonDocument["interval"];
  deviceID = jsonDocument["deviceid"];

  AuxSSID = ssid;
  AuxPASS = password;
  AuxAzureCon = connectionString;

  //testing results from eeprom



  return true;
}
void clearEEPROM()
{
  for (int i = 0; i < 512 + 1; i++)
  {
    EEPROM.write(i, 0);
    Serial.println("inside clearing eeprom");
  }
  EEPROM.commit();
}
bool WriteEEPROM() {
  clearEEPROM();

  deviceID = ESP.getEfuseMac();

  StaticJsonDocument<512> jsonDocument;
  String json;

  EEPROM.begin(512);


  jsonDocument["ssid"] = ssid;
  jsonDocument["password"] = password;
  jsonDocument["version"] = deviceVersion;
  jsonDocument["iothub"] = connectionString;
  jsonDocument["interval"] = INTERVAL;
  jsonDocument["deviceid"] = deviceIDmac;


  serializeJson(jsonDocument, json);
  json = json + '\0';
  Serial.println(json);
  for (int i = 0; i < json.length(); ++i)
  {
    EEPROM.write(i, json[i]);
  }
  EEPROM.write(json.length(), byte(0));
  //EEPROM.put(0, json);//json
  EEPROM.commit();

  return true;
}

static void InitWifi()
{
  Serial.println("Connecting...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  hasWifi = true;
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

bool StartWebServer() {
  Serial.println("StartWebServer");
  try
  {
    digitalWrite (LED, HIGH);  // turn on the ESP32 LED
    WiFi.mode(WIFI_AP);
    IPAddress ip(192, 168, 1, 100);
    IPAddress gateway(192, 168, 1, 100);
    IPAddress subnet(255, 255, 255, 0);
    WiFi.softAPConfig(ip, gateway, subnet);
    WiFi.softAP("SmartMeterRelay");
    IPAddress myIP = WiFi.softAPIP();
    Serial.println(ip);
    server.on("/", handleRoot);
    server.on("/login", handleLogin);
    server.on("/configuration", handleConfiguration);
    server.on("/save", handleSave);
    server.on("/ok", handleRestart);
    server.on("/inline", []()
    {
      server.send(200, "text/plain", "this works without need of authentification");
    });

    server.onNotFound(handleNotFound);
    //here the list of headers to be recorded
    const char* headerkeys[] = { "User-Agent", "Cookie" };
    size_t headerkeyssize = sizeof(headerkeys) / sizeof(char*);
    server.collectHeaders(headerkeys, headerkeyssize);
    server.begin();
    isServer = true;
  }
  catch (const std::exception&)
  {
  }
  digitalWrite (LED, LOW);  // turn on the ESP32 LED

  return true;
}
bool StartClient()
{
  if (ssid == "" && password == "")
  {
    return false;
  }
  else
  {
    WiFi.mode(WIFI_STA);
    Serial.print("Connecting to ");
    ssid = AuxSSID.c_str();
    password = AuxPASS.c_str();
    Serial.print(ssid); Serial.print("  :  "); Serial.println(password);
    WiFi.begin(ssid, password);
    int i = 0;

    while (WiFi.status() != WL_CONNECTED) {
      delay(1000);
      Serial.print(".");
      i++;
      //se passarem mais do que x tentativas
      if (i == 100)
      {
        return false;
      }
    }
  }
  hasWifi = true;
  return true;
}
//
void handleRestart()
{
  handleBye();
  WriteEEPROM();
  ESP.restart();

}
void handleBye() {
  String header;
  if (!is_authentified()) {
    server.sendHeader("Location", "/login");
    server.sendHeader("Cache-Control", "no-cache");
    server.send(301);
    return;
  }
  String content = "<html><body><form name=loginForm><H2>Goodbye!!</H2><br>";
  if (server.hasHeader("User-Agent")) {
    content +=  "<br><br>";
  }
  content += "You can access the page  <a href=\"/login?DISCONNECT=YES\">here</a></form></body></html>";
  content += style;
  server.send(200, "text/html", content);
}
void handleRoot() {
  String header;
  if (!is_authentified()) {
    server.sendHeader("Location", "/login");
    server.sendHeader("Cache-Control", "no-cache");
    server.send(301);
    return;
  }
  String content = "<html><body><form name=loginForm><H2>Bem Vindo!!</H2><br>";
  if (server.hasHeader("User-Agent")) {
    content +=  "<br><br>";
  }
  content += "You can access the page  <a href=\"/login?DISCONNECT=YES\">here</a></form></body></html>";
  content += style;
  server.send(200, "text/html", content);
}
void handleConfiguration() {
  String msg;
  AuxSSID = server.arg("ssid");
  AuxPASS = server.arg("password");
  AuxAzureCon = server.arg("AzureConnectionString");;

  ssid = AuxSSID.c_str();
  password = AuxPASS.c_str();
  connectionString = AuxAzureCon.c_str();
  Serial.println(ssid);
  Serial.println(password);
  Serial.println(connectionString);

  if (!isAuthenticated()) {
    server.sendHeader("Location", "/login");
    server.sendHeader("Cache-Control", "no-cache");
    server.send(301);
    return;
  }
  if (server.hasArg("DISCONNECT")) {
    server.sendHeader("Location", "/login");
    server.sendHeader("Cache-Control", "no-cache");
    server.sendHeader("Set-Cookie", "ESPSESSIONID=0");
    server.send(301);
    return;
  }
  if (server.hasArg("password") && server.hasArg("AzureConnectionString")) {
    if (ssid != "" && server.arg("password") != "" && server.arg("AzureConnectionString") != "")
    {
      server.sendHeader("Location", "/save");
      server.sendHeader("Cache-Control", "no-cache");
      server.sendHeader("Set-Cookie", "ESPSESSIONID=1");
      server.send(301);
      return;
    }
    msg = "Utilizador/Palavra-Passe está errada. Tente outra vez.";
  }
  //int strLen = Redes.length();
  Scan();
  String content = "<html><body><form action='/configuration' method='POST' name=loginForm>Configurar ESP<br>";
  content += "<br>Selecionar Wifi<br><select id=cbPais placeholder='ssid' name='ssid'><br>";
  for (int i = 0 ; i < 10 ; i++)
  {
    content += "<option>" + Redes[i] + "</option>";
  }
  content += "</select>";
  content += "Palavra-Passe:<input type='password' name='password' placeholder='password'><br>";
  content += "ConnectionString:<input type='text' name='AzureConnectionString' placeholder='AzureConnectionString'><br>";
  content += "<input type='submit' name='SUBMIT' value='Submit' class=btn id=btn></form>";
  content += teste;
  content += "</body></html>";
  content += selected;
  content += style;

  server.send(200, "text/html", content);
}
void handleSave() {
  if (!isAuthenticated()) {
    server.sendHeader("Location", "/login");
    server.sendHeader("Cache-Control", "no-cache");
    server.send(301);
    return;
  }
  if (ssid != "" && password != "")
  {
    server.sendHeader("Location", "/ok");
    server.sendHeader("Cache-Control", "no-cache");
    server.sendHeader("Set-Cookie", "ESPSESSIONID=1");
    server.send(301);
  }
  String content = "<html><body><form action='/save' method='POST'name=loginForm>Insert data to ESP<br>";
  content += "SSID:<input type='text' name='ssid' placeholder='SSID'><br>";
  content += "Password:<input type='password' name='password' placeholder='Password'><br>";
  content += "ConnectionString:<input type='text' name='AzureConnectionString' placeholder='AzureConnectionString'><br>";
  content += "<input type='submit' name='SUBMIT' value='Submit' class=btn></form>";
  content += "</body></html>";
  content += style;

  server.send(200, "text/html", content);

}
void handleNotFound() {
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET) ? "GET" : "POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  for (uint8_t i = 0; i < server.args(); i++) {
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.send(404, "text/plain", message);
}
void handleLogin() {
  String msg;
  if (server.hasHeader("Cookie")) {
    String cookie = server.header("Cookie");
  }
  if (server.hasArg("DISCONNECT")) {
    server.sendHeader("Location", "/login");
    server.sendHeader("Cache-Control", "no-cache");
    server.sendHeader("Set-Cookie", "ESPSESSIONID=0");
    server.send(301);
    return;
  }
  if (server.hasArg("PASSWORD")) {
    if (server.arg("PASSWORD") == devicePassword) {
      server.sendHeader("Location", "/configuration");
      server.sendHeader("Cache-Control", "no-cache");
      server.sendHeader("Set-Cookie", "ESPSESSIONID=1");
      server.send(301);
      return;
    }
    msg = "Wrong username/password! try again.";
  }
  String content = "<html><body><form action='/login' method='POST' name=loginForm>Entrar no ESP<br>";
  content += "Palavra-Passe:<input type='password' name='PASSWORD' placeholder='palavra-passe'><br>";
  content += "<input type='submit' name='SUBMIT' value='Submit' class=btn></form>" + msg + "<br></body></html>";
  content += style;
  server.send(200, "text/html", content);
}
bool isAuthenticated() {
  if (server.hasHeader("Cookie")) {
    String cookie = server.header("Cookie");
    if (cookie.indexOf("ESPSESSIONID=1") != -1) {
      return true;
    }
  }
  return false;
}
bool is_authentified() {
  if (server.hasHeader("Cookie")) {
    String cookie = server.header("Cookie");
    if (cookie.indexOf("ESPSESSIONID=1") != -1) {
      return true;
    }
  }
  return false;
}

void Scan()
{
  Serial.println("scan start");

  // WiFi.scanNetworks will return the number of networks found
  int n = WiFi.scanNetworks();
  Serial.println("scan done");

  if (n == 0) {
    Serial.println("Nenhuma rede encontrada");
  } else {
    Serial.print(n);
    Serial.println("Rede Encontrada");
    for (int i = 0; i < 10; ++i) {
      // Print SSID and RSSI for each network found
      Serial.print(i + 1);
      Serial.print(": ");
      Serial.print(WiFi.SSID(i));
      Redes[i] = WiFi.SSID(i).c_str();
      Serial.print(" (");
      Serial.print(WiFi.RSSI(i));
      Serial.print(")");
      Serial.println((WiFi.encryptionType(i) == WIFI_AUTH_OPEN) ? " " : "*");
      delay(10);
    }
  }
}

static void SendConfirmationCallback(IOTHUB_CLIENT_CONFIRMATION_RESULT result)
{
  if (result == IOTHUB_CLIENT_CONFIRMATION_OK)
  {
    Serial.println("Send Confirmation Callback finished - OK");
  }
}

static void MessageCallback(const char* payLoad, int size)
{
  Serial.println("Message callback:");
  Serial.println(payLoad);
}

static void DeviceTwinCallback(DEVICE_TWIN_UPDATE_STATE updateState, const unsigned char *payLoad, int size)
{
  char *temp = (char *)malloc(size + 1);
  if (temp == NULL)
  {
    return;
  }
  memcpy(temp, payLoad, size);
  temp[size] = '\0';
  // Display Twin message.
  Serial.println(temp);
  free(temp);
}

bool StartOTA(String otaDownloadURL) {


  t_httpUpdate_return ret = ESPhttpUpdate.update(otaDownloadURL);

  char* message = "{}";

  switch (ret) {
    case HTTP_UPDATE_FAILED:
      sprintf(message, "HTTP_UPDATE_FAILED Error (%d): %s\n", ESPhttpUpdate.getLastError(), ESPhttpUpdate.getLastErrorString().c_str());
    case HTTP_UPDATE_NO_UPDATES:
      Serial.println("HTTP_UPDATE_NO_UPDATES");
      return false;
    case HTTP_UPDATE_OK:
      Serial.println("HTTP_UPDATE_OK");

  }

  return true;
}

static int  DeviceMethodCallback(const char *methodName, const unsigned char *payload, int size, unsigned char **response, int *response_size)
{
  LogInfo("Try to invoke method %s", methodName);
  const char *responseMessage = "\"Successfully invoke device method\"";
  int result = 200;
  int lightState = 0;
  const char* checkdeviceVersion;
  const char* updateLink;
  const char* checkDeviceID;
  String link;

  if (strcmp(methodName, "update") == 0)
  {
    StaticJsonDocument<500> jsonDocument;
    auto error = deserializeJson(jsonDocument, payload);

    if (error) {
      return false;
    }
    else {
      //Link de update
      updateLink = jsonDocument["payload"];
      link = updateLink;

      StartOTA(link);//Faz update pela OTA
    }

  }
  else if (strcmp(methodName, "factoryreset") == 0)
  {
    LogInfo("A fazer Factory Reset...");
    clearEEPROM();
    
    ESP.restart();
  }
  else if (strcmp(methodName, "off") == 0)
  {
    //WriteEEPROM();//Escreve as configuraÃ§Ãµes para a EEPROM
    messageSending = false;
    ESP.deepSleep(1 * 60000000); //Entra em Deep-Sleep em 1 minuto
  }
  else if (strcmp(methodName, "restart") == 0)
  {
    LogInfo("A Reiniciar...");
    ESP.restart();
  }
  else if (strcmp(methodName, "start") == 0)
  {
    LogInfo("Iniciar envio dos eventos...");
    messageSending = true;
  }
  else if (strcmp(methodName, "stop") == 0)
  {
    LogInfo("Parar envio dos eventos...");
    messageSending = false;
  }
  else if (strcmp(methodName, "Relay1") == 0)
  {
    lightState = digitalRead(RELAY1);

    if (lightState == HIGH)
    {
      digitalWrite (RELAY1, LOW);
      LogInfo("Relay1 - OFF");
    }
    else
    {
      digitalWrite (RELAY1, HIGH);
      LogInfo("Relay1 - ON");
    }
  }
  else if (strcmp(methodName, "Relay2") == 0)
  {
    lightState = digitalRead(RELAY2);

    if (lightState == HIGH)
    {
      digitalWrite (RELAY2, LOW);
      LogInfo("Relay2 - OFF");
    }
    else
    {
      digitalWrite (RELAY2, HIGH);
      LogInfo("Relay2 - ON");
    }
  }
  else if (strcmp(methodName, "Relay3") == 0)
  {
    lightState = digitalRead(RELAY3);

    if (lightState == HIGH)
    {
      digitalWrite (RELAY3, LOW);
      LogInfo("Relay3 - OFF");
    }
    else
    {
      digitalWrite (RELAY3, HIGH);
      LogInfo("Relay3 - ON");
    }
  }
  else if (strcmp(methodName, "Relay4") == 0)
  {
    lightState = digitalRead(RELAY4);

    if (lightState == HIGH)
    {
      digitalWrite (RELAY4, LOW);
      LogInfo("Relay4 - OFF");
    }
    else
    {
      digitalWrite (RELAY4, HIGH);
      LogInfo("Relay4 - ON");
    }
  }
  else
  {
    LogInfo("Método %s não encontrado", methodName);
    responseMessage = "\"Método não encontrado\"";
    result = 404;
  }
  *response_size = strlen(responseMessage) + 1;
  *response = (unsigned char *)strdup(responseMessage);

  return result;
}

void SendLightState()
{
  //Read Relay PIN states.
  int relay1 = digitalRead ( v);
  int relay2 = digitalRead (RELAY2);
  int relay3 = digitalRead (RELAY3);
  int relay4 = digitalRead (RELAY4);
  char messagePayload[MESSAGE_MAX_LEN]; // Mensagem com o estado dos relays

  // Envia os dados para o IoT Hub
  snprintf(messagePayload, MESSAGE_MAX_LEN, messageData, deviceIDmac, DEVICE_TYPE, relay1, relay2, relay3, relay4);
  Serial.println(messagePayload);
  EVENT_INSTANCE* message = Esp32MQTTClient_Event_Generate(messagePayload, MESSAGE);
  Esp32MQTTClient_SendEventInstance(message);
}

void button()
{
  int buttonState ;

  buttonState = digitalRead(BUTTON_PIN);

  // Verifica se o botão BOOT foi pressionado
  if (buttonState == LOW)
  {
    // turn LED off:
    digitalWrite(LED, HIGH);
    StartWebServer();
    delay(1000);
  }
  else
  {
    // turn LED off:
    digitalWrite(LED, LOW);
  }
}

void setup()
{
  Serial.begin(115200);
  deviceID = ESP.getEfuseMac();
  snprintf(deviceIDmac, 23, "%04X%08X", (uint16_t)(deviceID >> 32), (uint32_t)deviceID);
  Serial.println(deviceIDmac);
  Serial.println("Initializing...");

  if (ReadEEPROM())
  {
    if (StartClient())
    {
      const char* messageData = "{\"Setup\"}";
      char messagePayload[MESSAGE_MAX_LEN];
      connectionString = AuxAzureCon.c_str();

      pinMode(RELAY1, OUTPUT);
      pinMode(RELAY2, OUTPUT);
      pinMode(RELAY3, OUTPUT);
      pinMode(RELAY4, OUTPUT);
      pinMode(LED, OUTPUT);
      pinMode(BUTTON_PIN, INPUT);

      digitalWrite (RELAY1, LOW);
      digitalWrite (RELAY2, LOW);
      digitalWrite (RELAY3, LOW);
      digitalWrite (RELAY4, LOW);

      Esp32MQTTClient_SetOption(OPTION_MINI_SOLUTION_NAME, "GetStarted");
      Esp32MQTTClient_Init((const uint8_t*)connectionString, true);

      Esp32MQTTClient_SetSendConfirmationCallback(SendConfirmationCallback);
      Esp32MQTTClient_SetMessageCallback(MessageCallback);
      Esp32MQTTClient_SetDeviceTwinCallback(DeviceTwinCallback);
      Esp32MQTTClient_SetDeviceMethodCallback(DeviceMethodCallback);

      send_interval_ms = millis();//Set time
    }
    else
    {
      StartWebServer();
    }
  }
  else
  {
    StartWebServer();
  }
}
void loop()
{
  int cntSignal;
  INTERVAL = 10000;

  if (isServer)
  {
    server.handleClient();
  }
  else {

    button();

    if (WiFi.status() == WL_CONNECTED) {
      //Verificar se pode enviar os eventos para o IoT Hub e apenas a cada 10 segundos (INTERVAL time)
      if (messageSending &&
          (int)(millis() - send_interval_ms) >= INTERVAL)
      {
        digitalWrite (LED, HIGH);  // Ligar o ESP32 LED
        SendLightState();
        send_interval_ms = millis();
      }
      else
      {
        while (WiFi.status() != WL_CONNECTED) {
          if (messageSending &&
              (int)(millis() - send_interval_ms) >= INTERVAL)
          {
            // turn off the LED
            networkLoss++;
            StartClient();
            Esp32MQTTClient_Check();

            send_interval_ms = millis();
          }
        }
      }
      digitalWrite (LED, LOW);  // desligar o ESP32 LED
    }
  }
}
