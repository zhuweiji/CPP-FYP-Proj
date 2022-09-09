class Car{
public:
    int acceleration = 0;
    Car(int initial_acceleration){
        acceleration = initial_acceleration;
    };

    void accelerate(){
        acceleration ++;
    }
};
