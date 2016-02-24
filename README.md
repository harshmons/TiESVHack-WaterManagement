## User Interface
![alt Screen1](https://github.com/atomiton/TiESVHack-WaterManagement/blob/master/TieHackathon-UI/images/Water_Managment_Screen_1.png)
![alt Screen2](https://github.com/atomiton/TiESVHack-WaterManagement/blob/master/TieHackathon-UI/images/Water_Managment_Screen_2.png)
![alt Screen3](https://github.com/atomiton/TiESVHack-WaterManagement/blob/master/TieHackathon-UI/images/Water_Managment_Screen_3.png)

## Who are we?
We are palying NGO's role who are responsible for providing water to each residents on daily basis based on their budegts.


## How it Works
#### Core Logic -
*A Typical day* starts from **6:00 AM** when the budgets of each residents gets updated and assignment of water resources to every residents happens till **10:00 AM**. At **2:00 PM** again it will check for the residents who didn't got water and assign them Household resellers.

#### UI Specifications -
UI contains following things-
* **Panel** *(Position Top-Right)* - shows Current working day,Current working hour,NGO's current Balance,NGO's starting balance
* **Toggling panel** *(Position Top Left)* - shows the notifications for different water resources.
* **Markers Dropdown** *(Postion Bottom Left)* - shows the seleted markers*(i.e. Residents,Wells,StandPipes,Mobile Vendors,HouseHold Resellers)* on the google map based on their GEO coordinates
* **Search box** *(Postion Center Bottom)* - shows the details of individual marker based on the Radio button selection and name of the marker*(i.e. Residents,Wells,StandPipes,Mobile Vendors,HouseHold Resellers)*
* **Dig Well Button** *(Position Bottom Right)* - used to Dig well on default Geo location based on the need.
* **Resident Water Acess Statistics Button** *(Position Center Bottom)* - shows the Graphical represtation for the Residents water access status

## Application setup steps
* Clone complete application from Github

* Start watermanagement aaplication jar

* Load data by running query from **queryToLoadData.txt**

* Start java application by running **startNGO.sh**

* Start virtual clock

* Start the simultation by running query from **queryToStartExecution.txt**

## Working Demo
[Water Management Url](http://54.152.232.38:443 "Click to see demo")
