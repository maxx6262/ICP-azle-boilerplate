CANISTER_NAME=$1;
SERVER_IP=$(curl ifconfig.me);

#Launching of Dfx tool
dfx start --background --clean;
DFX_PORT=$(dfx info replica-port);
ICP_URL="http://"$SERVER_IP":"$DFX_PORT;

echo "Dashboard at url :" $ICP_URL;

#Canister management
echo "Creation of Canister" $CANISTER_NAME;
dfx canister create $CANISTER_NAME;
echo "Deployment of Canister" $CANISTER_NAME;
dfx deploy;

#Get CANISTER_ID
CANISTER_ID=$(dfx canister id $CANISTER_NAME);
CANISTER_URL="http://"$CANISTER_ID".localhost:8000";