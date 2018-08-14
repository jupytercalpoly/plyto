from ipykernel.comm import Comm, CommManager
from IPython import get_ipython

class PlytoAPI:
    """
    A python API for visualizing iterative datasets

    :param spec: an Altair spec describing the desired visualization

    :param size: the size of each step in the dataset

    :param total_steps: the number of steps/batches/samples/sections in the dataset

    :param current_step: the current step being iterated through

    :param progress: the current progress of iterating through the dataset
    """

    def __init__(self, spec, size=0, steps=0):
        self.spec = spec
        self.size = size
        self.total_steps = steps
        self.current_step = 1
        self.current_progress = 0
        self.total_progress = 0
        self.runtime = 0
        self.data_set = {}

        # initiate comm manager, register target, 
        # initiate comm, and register comm
        self.comm_manager = get_ipython().kernel.comm_manager
        self.comm_manager.register_target('plyto', self.f)
        self.comm = Comm('plyto')
        self.comm_manager.register_comm(self.comm)

        def target_func(comm, msg):
            print('test1')

            @comm.on_msg
            def _recv(msg):
                print('test2')

            comm.send({'test3':'hi3'})

        get_ipython().kernel.comm_manager.register_target('plyto-data', target_func)

    def update_current_progress(self, new_progress):
        """
        Update the progress of iterating through the current step and send data to frontend

        :param new_progress: the new progress
        """
        self.current_progress = new_progress

    def update_total_progress(self, new_progress):
        """
        Update the progress of iterating through the current step and send data to frontend

        :param new_progress: the new progress
        """
        self.total_progress = new_progress

    def update_size(self, new_size):
        """
        Update size of the dataset and send data to frontend

        :param new_size: the new size
        """
        self.size = new_size

    def update_total_steps(self, new_steps):
        """
        Update the number of steps in the dataset and send data to frontend

        :param new_steps: the new number of steps
        """
        self.total_steps = new_steps

    def update_current_step(self, new_step):
        """
        Update the current step being iterated through 

        :param new_steps: the current step
        """
        self.current_step = new_step

    def update_runtime(self, new_runtime):
        """
        Update the total runtime 

        :param new_runtime: the current runtime
        """
        self.runtime = new_runtime

    def update_data_set(self, new_data):
        """
        Update the dataset

        :param new_data: the new data being added
        """

        self.data_set = new_data

    def send_data(self):
        """
        Send the spec and dataset metadata to the frontend
        """
        data = {
            "spec": self.spec,
            "size": self.size,
            "totalSteps": self.total_steps,
            "currentStep": self.current_step,
            "currentProgress": (self.current_progress / self.size) * 100,
            "totalProgress": (self.total_progress / (self.size * self.total_steps))
            * 100,
            "dataSet": self.data_set,
            "runTime": self.runtime,
        }

        self.comm.send(data=data)
        if data['totalProgress'] == 100:
            self.comm.close()

        # TODO: close comm on an interrupted kernel

    def f():
        pass