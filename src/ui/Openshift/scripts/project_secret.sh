DevProjectName=rtb-dms-dev
TestProjectName=rtb-dms-test
ProdProjectName=rtb-dms-prod

echo
echo "Please make a selection!"
echo "1) $DevProjectName"
echo "2) $TestProjectName"
echo "3) $ProdProjectName"
echo "q) Quit"
echo

read choice

case $choice in
    'q') exit;;
    '1') oc project $DevProjectName;;
    '2') oc project $TestProjectName;;
    '3') oc project $ProdProjectName;;
    *)   echo "menu item is not available; try again!";;
esac

echo
echo "Paste/type json file content, press 'Enter' then 'Ctrl+D'"
echo

json=$(</dev/stdin)

base64_json=$(printf "$json" | base64)

echo Updating the secret ...

oc patch secret secret-appsettings-ui -p '{"data": {"env.json": "'$base64_json'"}}}'
