import { useEffect, useState } from "react";
import { Header } from "../../components/Header";
import api from "../../services/api";
import { Food } from "../../components/Food";
import { ModalAddFood } from "../../components/ModalAddFood";
import { ModalEditFood } from "../../components/ModalEditFood";
import { FoodModel } from "../../types";
import { FoodsContainer } from "./styles";

type DashboardProps = {
  foods: FoodModel[];
  editingFood: FoodModel;
  modalOpen: boolean;
  editModalOpen: boolean;
};

export function Dashboard() {
  const [state, setState] = useState<DashboardProps>({} as DashboardProps);

  useEffect(() => {
    async function loadFoods() {
      const response = await api.get<FoodModel[]>("/foods");

      setState({
        foods: response.data,
        editingFood: {} as FoodModel,
        modalOpen: false,
        editModalOpen: false,
      });
    }

    loadFoods();
  },[])

  const toggleModal = () => {
    const { modalOpen } = state;

    setState({ ...state, modalOpen: !modalOpen });
  };

  const handleAddFood = async (food: FoodModel) => {
    try {
      const response = await api.post("/foods", {
        ...food,
        available: true,
      });

      setState({
        ...state,
        foods: [...state.foods, response.data],
        modalOpen: false,
      });
    } catch(err) {
      console.log(err);
    }
  };

  const handleDeleteFood = async (id: number) => {
    const newFoods = state.foods.filter(food => food.id !== id);
    await api.delete(`/foods/${id}`);
    setState({ ...state, foods: newFoods });
  };

  const toggleEditModal = () => {
    const { editModalOpen } = state;
    setState({ ...state, editModalOpen: !editModalOpen });
  };

  const handleEditFood = (food: FoodModel) => {
    setState({ ...state, editingFood: food, editModalOpen: true });
  };

  const handleUpdateFood = async (food: FoodModel) => {

     try {
       const foodUpdated = await api.put(`/foods/${state.editingFood.id}`, {
         ...state.editingFood,
         ...food,
       });

       const foodsUpdated = state.foods.map((f) =>
         f.id !== foodUpdated.data.id ? f : foodUpdated.data
       );

      setState({
        ...state,
        foods: foodsUpdated,
        editModalOpen: !state.editModalOpen,
      });
     } catch (err) {
       console.log(err);
     }
  };
  
  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={state.modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={state.editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={state.editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {state.foods &&
          state.foods.map((food) => (
            <Food
              key={food.id}
              food={food}
              handleDelete={() => handleDeleteFood(food.id)}
              handleEditFood={() => handleEditFood(food)}
            />
          ))}
      </FoodsContainer>
    </>
  );
}
