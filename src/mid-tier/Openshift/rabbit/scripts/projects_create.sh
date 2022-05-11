DeploymentTemplate=rtb-dms-mid-tier-rabbit-mq-deploy-configuration.yaml

DeploymentConfiguration=latestBuild/rabbit-mq-deploy-configuration.yaml.json

ToolsProjectName=rtb-dms-tools
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

echo Parsing the build template ...
oc process \
-f ../templates/$DeploymentTemplate \
 > $DeploymentConfiguration

echo Processing the build template ...
oc create -f $DeploymentConfiguration