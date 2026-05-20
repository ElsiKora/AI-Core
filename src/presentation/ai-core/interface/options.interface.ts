import type { ICliInterfaceService } from "@application/interface/cli-interface-service.interface";
import type { IBeanFactoryOptionsInterface } from "@elsikora/bean";

/**
 * Public adapter initialization options.
 */
export interface IAiCoreAdapterOptions {
	beanOptions?: IBeanFactoryOptionsInterface;
	cliInterface?: ICliInterfaceService;
}
