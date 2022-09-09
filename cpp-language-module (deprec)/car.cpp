// #include <rttr/registration>
// using namespace rttr;

#include <iostream>
#include <catch2.h>

struct MyStruct { 
    MyStruct() {};
    void func(double) {};
    int data; 
};

class Car{
    public:
        void drive(){
            acceleration ++;
        };
    public:
        int acceleration = 0;
};

