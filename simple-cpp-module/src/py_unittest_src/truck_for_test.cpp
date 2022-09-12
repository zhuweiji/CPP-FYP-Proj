class Truck{
public:
    int acceleration = 0;
    Truck(int initial_acceleration){
        acceleration = initial_acceleration;
    };

    void accelerate(){
        acceleration ++;
    }
};
