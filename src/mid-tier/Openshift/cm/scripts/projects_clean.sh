ToolsProjectName=rtb-dms-tools
DevProjectName=rtb-dms-dev
TestProjectName=rtb-dms-test
ProdProjectName=rtb-dms-prod

echo
echo "Please make a selection!"
echo "1) $ToolsProjectName"
echo "2) $DevProjectName"
echo "3) $TestProjectName"
echo "4) $ProdProjectName"
echo "q) Quit"
echo

read choice

case $choice in
    'q') exit;;
    '1') oc project $ToolsProjectName;;
    '2') oc project $DevProjectName;;
    '3') oc project $TestProjectName;;
    '4') oc project $ProdProjectName;;
    *)   echo "menu item is not available; try again!";;
esac

# echo =============================================================================
# echo Cleaning project ...
# echo =============================================================================

oc delete all --selector app="case-management"
oc delete all --selector app="case-management-release"
