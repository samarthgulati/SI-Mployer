function changeClasses(d, node){
	var filterCount = d.filterCount;
            var currentClass= d3.select(node).attr("class");
            var newClass = currentClass;
            switch(filterCount){
                case 0:
                if (currentClass.indexOf("first") >-1){
                    //filter has dropped from 1 to 0
                    newClass = currentClass.replace("first","");
                }
                break;
                case 1:
                if (currentClass.indexOf("second") >-1){
                    //filter has dropped from 2 to 1
                    newClass = currentClass.replace("second","first");
                }else{
                    //filter has increased from 0 to 1
                    newClass = currentClass.trim() + " first";
                }
                break;
                case 2:
                if (currentClass.indexOf("third") >-1){
                    //filter has dropped from 3 to 2
                    newClass = currentClass.replace("third","second");
                }else{
                    //filter has increased from 1 to 2
                    newClass = currentClass.replace("first","second");
                }
                break;
                case 3:
                if (currentClass.indexOf("fourth") >-1){
                    //filter has dropped from 3 to 2
                    newClass = currentClass.replace("fourth","third");
                }else{
                    //filter has increased from 1 to 2
                    newClass = currentClass.replace("second","third");
                }
                break;
            }
            return newClass.trim();
}