from .plyto import PlytoAPI
from time import time


class PytorchLossCallback:
    """
    Create a callback that will track and display training progress and loss

    :param steps: number of epochs/steps

    :param sample_amount: number of samples/steps per epoch

    :param start_time: start of training time, used to calculate runtime

    :param plyto: an instance of a PlytoAPI class
    """

    def __init__(self, plyto_instance, steps=0, sample_amount=0):
        self.total_progress = 0
        self.start_time = time()
        self.plyto = plyto_instance
        self.initalize_plyto(steps, sample_amount)

    def initalize_plyto(self, steps, sample_amount):
        """
        Initalize the Plyto instance's total steps and step size
        
        :param steps: total number of steps

        :param sample_amount: number of samples/batches per step
        """
        self.plyto.update_total_steps(steps)
        self.plyto.update_size(sample_amount)

    def update_step_number(self, new_step):
        """
        Update the current step/epoch

        :param new_step: the current step/epoch
        """
        self.plyto.update_current_step(new_step)

    def update_total_progress(self, progress):
        """
        Update the total training progress

        :param progress: the amount to increment the total progress by
        """
        self.total_progress += progress

    def update_data(self, current_progress, loss):
        """
        Update progress, total progress, loss, and runtime before sending data to frontend

        :param current_progress: the progress of training the current step/epoch
        
        :param loss: the current batch's training loss
        """
        self.plyto.update_current_progress(current_progress)
        self.plyto.update_total_progress(self.total_progress)
        self.plyto.update_data_set({"loss": loss, "samples": self.total_progress})
        self.plyto.update_runtime(time() - self.start_time)
        self.plyto.send_data()
